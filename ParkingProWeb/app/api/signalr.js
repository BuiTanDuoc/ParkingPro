import * as signalR from '@microsoft/signalr';
import { getApiBaseUrl, tokenStorage } from './http';

let connection = null;

/**
 * Kết nối tới ParkingHub và join group của 1 bãi xe cụ thể.
 * Trả về connection để component tự đăng ký .on(...) và tự dispose khi unmount.
 */
export const connectToParkingHub = async (parkingLotId) => {
    if (connection) {
        await connection.stop();
    }

    connection = new signalR.HubConnectionBuilder()
        .withUrl(`${getApiBaseUrl()}/hubs/parking`, {
            accessTokenFactory: () => tokenStorage.getAccessToken(),
        })
        .withAutomaticReconnect()
        .build();

    await connection.start();
    await connection.invoke('JoinLotGroup', parkingLotId);

    return connection;
};

export const disconnectFromParkingHub = async () => {
    if (connection) {
        await connection.stop();
        connection = null;
    }
};
