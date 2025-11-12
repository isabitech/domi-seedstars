import type { User, LoginForm, ApiResponse } from '../types';

// Mock data for development - replace with actual API calls
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'HO',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    username: 'branch1',
    role: 'BR',
    branchId: 'br-001',
    isActive: true,
    createdAt: '2024-01-01',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(credentials: LoginForm): Promise<ApiResponse<User>> {
    await delay(1000); // Simulate network delay
    
    // Mock authentication logic
    const user = mockUsers.find(
      (u) => u.username === credentials.username && u.isActive
    );
    
    if (!user) {
      return {
        success: false,
        error: 'Invalid username or password',
      };
    }
    
    // Mock password validation (in real app, this would be handled by backend)
    const validPassword = credentials.username === 'admin' ? 'admin123' : 'branch123';
    if (credentials.password !== validPassword) {
      return {
        success: false,
        error: 'Invalid username or password',
      };
    }
    
    // Update last login
    const loggedInUser = {
      ...user,
      lastLogin: new Date().toISOString(),
    };
    
    // Send email notification for branch login (mock)
    if (user.role === 'BR') {
      console.log('📧 Email notification: Branch logged in', user.username);
    }
    
    return {
      success: true,
      data: loggedInUser,
      message: 'Login successful',
    };
  },
  
  async logout(): Promise<void> {
    await delay(500);
    // Clear any tokens, cleanup, etc.
  },
  
  async validateToken(): Promise<ApiResponse<User>> {
    // Mock token validation
    await delay(500);
    return {
      success: true,
      data: mockUsers[0], // Return current user
    };
  },
};

export const emailService = {
  async sendBranchLoginNotification(branchUser: User): Promise<void> {
    // Mock Brevo integration
    console.log('📧 Sending email notification via Brevo');
    console.log('Branch login:', branchUser.username, 'at', new Date().toLocaleString());
    
    // In real implementation:
    // - Use Brevo API to send email
    // - Send to HO email addresses
    // - Include branch details and login time
  },
};