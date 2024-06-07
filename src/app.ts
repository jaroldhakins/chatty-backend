import expres, { Express } from 'express';
import { CreafamServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';
import { config } from '@root/config';

class Application {
    public initialize(): void {
        this.loadConfig();
        databaseConnection();
        const app: Express = expres();
        const server: CreafamServer = new CreafamServer(app);
        server.start();
    }

    private loadConfig(): void {
        config.validateConfig();
        config.cloudinaryConfig();
    }
}

const application: Application = new Application();
application.initialize();
