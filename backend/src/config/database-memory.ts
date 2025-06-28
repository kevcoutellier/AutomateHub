// In-memory database for testing purposes
// This is a temporary solution to test authentication without MongoDB

interface InMemoryUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'expert' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class InMemoryDatabase {
  private users: Map<string, InMemoryUser> = new Map();
  private nextId = 1;

  generateId(): string {
    return (this.nextId++).toString();
  }

  async createUser(userData: Omit<InMemoryUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<InMemoryUser> {
    const user: InMemoryUser = {
      _id: this.generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(user._id, user);
    return user;
  }

  async findUserByEmail(email: string): Promise<InMemoryUser | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<InMemoryUser | null> {
    return this.users.get(id) || null;
  }

  async updateUser(id: string, updates: Partial<InMemoryUser>): Promise<InMemoryUser | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Get all users (for debugging)
  getAllUsers(): InMemoryUser[] {
    return Array.from(this.users.values());
  }
}

export const memoryDb = new InMemoryDatabase();

export const connectDatabase = async (): Promise<void> => {
  console.log('✅ Using in-memory database for testing');
  
  // Create a test user for demonstration
  const testUser = await memoryDb.createUser({
    email: 'test@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4SH1Vk.Viy', // 'password123'
    firstName: 'Test',
    lastName: 'User',
    role: 'client',
    isEmailVerified: true
  });

  console.log('✅ Test user created:', { email: testUser.email, id: testUser._id });
};

export type { InMemoryUser };
