describe('AuthService', () => {
  let AuthService, $httpBackend, API_URL;

  beforeEach(angular.mock.module('dateNightApp'));

  beforeEach(inject((_AuthService_, _$httpBackend_, _API_URL_) => {
    AuthService = _AuthService_;
    $httpBackend = _$httpBackend_;
    API_URL = _API_URL_;
  }));

  it('should authenticate user', (done) => {
    const credentials = { username: 'test', password: 'test123' };
    const response = { token: 'jwt-token', user: { username: 'test' } };

    $httpBackend.expectPOST(`${API_URL}/auth/login`, credentials)
      .respond(200, response);

    AuthService.login(credentials).then((res) => {
      expect(res.data).toEqual(response);
      done();
    });

    $httpBackend.flush();
  });
});
