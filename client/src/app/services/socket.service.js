angular.module('dateNightApp')
  .factory('SocketService', ['socketFactory', 'SOCKET_URL', function(socketFactory, SOCKET_URL) {
    const ioSocket = io.connect(SOCKET_URL);
    
    return socketFactory({
      ioSocket: ioSocket
    });
  }]);
