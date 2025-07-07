describe('Simple Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test string operations', () => {
    const message = 'Hello AutomateHub';
    expect(message).toContain('AutomateHub');
    expect(message.length).toBeGreaterThan(5);
  });

  it('should test async operations', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });

  it('should test object properties', () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name', 'Test User');
    expect(user.email).toMatch(/^.+@.+\..+$/);
  });
});
