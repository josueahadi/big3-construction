const { handleMessage } = require('../../src/queue/certExpiryConsumer');
describe('Consumer handleMessage', () => {
  it('logs expected notification text', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const msg = {
      cert_id: 1,
      cert_name: 'Basic Safety',
      expires_at: '2099-12-31',
      days_left: 10,
      worker_id: 123,
      worker_name: 'John Worker',
      pm_user_id: 5,
      pm_name: 'Jane PM',
      pm_email: 'pm@example.com'
    };
    await handleMessage(msg);
    expect(spy).toHaveBeenCalled();
    const logged = spy.mock.calls[0][0];
    expect(logged).toMatch(/NOTIFICATION: Sending email to PM/);
    spy.mockRestore();
  });
});
