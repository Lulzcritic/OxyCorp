
import { io } from 'socket.io-client';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const SECRET = process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-key';

function generateToken(userId: string, username: string) {
    return jwt.sign({ sub: userId, userId, username, email: `${username}@test.com` }, SECRET, { expiresIn: '1h' });
}

async function main() {
    console.log('Testing Chat Gateway...');

    const tokenA = generateToken('user-a', 'Alice');
    const tokenB = generateToken('user-b', 'Bob');

    const clientA = io('http://localhost:3000/chat', {
        extraHeaders: { Authorization: `Bearer ${tokenA}` }
    });

    const clientB = io('http://localhost:3000/chat', {
        extraHeaders: { Authorization: `Bearer ${tokenB}` }
    });

    // Wait for connection
    await new Promise<void>(resolve => {
        let connected = 0;
        const check = () => {
            connected++;
            if (connected === 2) resolve();
        };
        clientA.on('connect', () => { console.log('Alice Connected'); check(); });
        clientB.on('connect', () => { console.log('Bob Connected'); check(); });
    });

    // Listen on B
    const receivePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject('Timeout waiting for message'), 5000);
        
        clientB.on('chat:broadcast', (data) => {
            console.log('Bob Received:', data);
            if (data.sender === 'Alice' && data.content === 'Hello Bob!') {
                clearTimeout(timeout);
                resolve();
            }
        });
    });

    // Send from A
    console.log('Alice sending message...');
    clientA.emit('chat:message', { content: 'Hello Bob!' });

    await receivePromise;
    console.log('Success: Message received!');

    clientA.disconnect();
    clientB.disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
