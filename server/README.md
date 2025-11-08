Environment Setup

Create a .env file inside the server/ folder with the following values:
PORT=7000
NODE_ENV=development
MONGO_URI=mongodb+srv://vishwajeetkumar0205_db_user:ek0boh1RemtWhJSy@cluster0.vwgasay.mongodb.net/Knovator?retryWrites=true&w=majority&appName=Cluster0

Starting the Server

Start Docker for Redis
Make sure Docker Desktop is running.
When you run the app, Redis will start automatically because the connection details are already configured in the docker-compose.yml file.

Install Dependencies

npm install


Start the Development Server

npm run dev


(Optional) If you have a background worker process for queue handling:

npm run worker


Note: The worker script is currently under development, so it may not be functional yet.

✅ Notes

The API will be available at: http://localhost:7000

Redis connection is automatically established when the server starts.

Make sure MongoDB Atlas and Redis Cloud are accessible from your local environment.