import { SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

export const socketConfig: SocketIoConfig = {';
  url: environment.socketUrl || 'http://localhost:3000',
  options: {},
}
