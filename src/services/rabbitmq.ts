import axios from 'axios';
import type { RabbitMQCluster, QueueInfo, ClusterStats, Node, Connection, User } from '../types/cluster';

class RabbitMQService {
  private baseUrl = '/api';
  private retryAttempts = 3;
  private retryDelay = 1000;

  private async makeRequest(url: string, options: any = {}, attempts = this.retryAttempts): Promise<any> {
    console.log(`Making API request to ${url}`, { options });
    
    try {
      const response = await axios({
        url: `${this.baseUrl}${url}`,
        ...options,
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 300,
      });
      console.log(`API request successful: ${url}`, { status: response.status });
      return response.data;
    } catch (error) {
      if (attempts > 1 && axios.isAxiosError(error)) {
        console.warn(`API request failed, retrying... (${attempts - 1} attempts left)`, {
          url,
          error: error.message
        });
        
        // Retry on network errors or 5xx responses
        if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          return this.makeRequest(url, options, attempts - 1);
        }
      }
      
      console.error('API request failed', {
        url,
        error: axios.isAxiosError(error) ? error.message : 'Unknown error'
      });
      
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to connect to RabbitMQ');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async connect(cluster: RabbitMQCluster): Promise<boolean> {
    console.log('Attempting to connect to cluster', {
      name: cluster.name,
      host: cluster.host,
      port: cluster.port
    });
    
    try {
      const overview = await this.makeRequest('/overview', {
        auth: {
          username: cluster.username,
          password: cluster.password
        }
      });
      console.log('Successfully connected to cluster', { name: cluster.name });
      return !!overview;
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    }
  }

  async disconnect(clusterId: string): Promise<void> {
    console.log('Disconnecting from cluster', { clusterId });
    
    try {
      // Close any active connections
      const connections = await this.getConnections(clusterId);
      await Promise.all(
        connections.map(conn => 
          this.makeRequest(`/connections/${conn.id}`, { method: 'DELETE' })
        )
      );
      console.log('Successfully disconnected from cluster', { clusterId });
    } catch (error) {
      console.error('Error disconnecting from cluster', { clusterId, error });
      throw error;
    }
  }

  async getNodes(clusterId: string): Promise<Node[]> {
    console.log('Fetching cluster nodes', { clusterId });
    const data = await this.makeRequest('/nodes');
    console.log('Successfully fetched nodes', { count: data.length });
    return data.map((node: any) => ({
      name: node.name,
      type: node.type,
      running: node.running,
      uptime: node.uptime,
      metrics: {
        cpuUsage: node.cpu_usage,
        memoryUsage: node.mem_used,
        diskFree: node.disk_free,
        fdUsage: node.fd_used,
        socketUsage: node.sockets_used,
        erlangProcesses: node.proc_used
      }
    }));
  }

  async getQueues(clusterId: string): Promise<QueueInfo[]> {
    console.log('Fetching queues', { clusterId });
    const data = await this.makeRequest('/queues');
    console.log('Successfully fetched queues', { count: data.length });
    return data.map((queue: any) => ({
      name: queue.name,
      messages: queue.messages,
      consumers: queue.consumers,
      state: queue.state,
      memory: queue.memory,
      messageStats: {
        publishRate: queue.message_stats?.publish_details?.rate || 0,
        deliverRate: queue.message_stats?.deliver_details?.rate || 0,
        ackRate: queue.message_stats?.ack_details?.rate || 0,
        redeliverRate: queue.message_stats?.redeliver_details?.rate || 0
      }
    }));
  }

  async getClusterStats(clusterId: string): Promise<ClusterStats> {
    console.log('Fetching cluster stats', { clusterId });
    const [overview, nodes] = await Promise.all([
      this.makeRequest('/overview'),
      this.makeRequest('/nodes')
    ]);
    
    const stats = {
      totalQueues: overview.queue_totals?.total || 0,
      totalConnections: overview.object_totals?.connections || 0,
      publishRate: overview.message_stats?.publish_details?.rate || 0,
      consumeRate: overview.message_stats?.deliver_get_details?.rate || 0,
      nodes: nodes.length,
      runningNodes: nodes.filter((n: any) => n.running).length
    };
    
    console.log('Successfully fetched cluster stats', stats);
    return stats;
  }

  async getConnections(clusterId: string): Promise<Connection[]> {
    console.log('Fetching connections', { clusterId });
    const data = await this.makeRequest('/connections');
    console.log('Successfully fetched connections', { count: data.length });
    return data.map((conn: any) => ({
      id: conn.name,
      client: conn.client_properties?.connection_name || 'Unknown',
      state: conn.state,
      channels: conn.channels,
      receivedBytes: conn.recv_oct,
      sentBytes: conn.send_oct,
      connectedAt: conn.connected_at,
      peerHost: conn.peer_host,
      peerPort: conn.peer_port,
      ssl: conn.ssl
    }));
  }

  async closeConnection(clusterId: string, connectionId: string): Promise<void> {
    console.log('Closing connection', { clusterId, connectionId });
    await this.makeRequest(`/connections/${connectionId}`, { method: 'DELETE' });
    console.log('Successfully closed connection', { connectionId });
  }

  async getUsers(clusterId: string): Promise<User[]> {
    console.log('Fetching users', { clusterId });
    const data = await this.makeRequest('/users');
    console.log('Successfully fetched users', { count: data.length });
    return data.map((user: any) => ({
      username: user.name,
      tags: user.tags,
      permissions: user.permissions
    }));
  }

  async addUser(clusterId: string, user: Omit<User, 'permissions'>): Promise<void> {
    console.log('Adding new user', { clusterId, username: user.username });
    await this.makeRequest('/users', {
      method: 'POST',
      data: {
        name: user.username,
        password: user.password,
        tags: user.tags.join(',')
      }
    });
    console.log('Successfully added user', { username: user.username });
  }

  async deleteUser(clusterId: string, username: string): Promise<void> {
    console.log('Deleting user', { clusterId, username });
    await this.makeRequest(`/users/${username}`, { method: 'DELETE' });
    console.log('Successfully deleted user', { username });
  }

  async updateUserPermissions(
    clusterId: string,
    username: string,
    vhost: string,
    permissions: User['permissions']
  ): Promise<void> {
    console.log('Updating user permissions', { clusterId, username, vhost });
    await this.makeRequest(`/permissions/${vhost}/${username}`, {
      method: 'PUT',
      data: permissions
    });
    console.log('Successfully updated user permissions', { username, vhost });
  }

  async checkHealth(): Promise<boolean> {
    console.log('Performing health check');
    try {
      await this.makeRequest('/health');
      console.log('Health check passed');
      return true;
    } catch (error) {
      console.error('Health check failed', error);
      return false;
    }
  }
}

export const rabbitMQService = new RabbitMQService();