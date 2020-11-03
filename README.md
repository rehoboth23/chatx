# chatx
ChatX is an instant messaging web application providing real-time communication and updates between the server and client ends using web sockets and a Rest API.  
The backend is built using Django-Rest framework, and the sockets are integrated using Channels. The front end is built using primarily using React. It is integrated with React-Redux primarily for authentication purposes and to maintain web socket information. It also makes extensive use of other react libraries e.g. axios, react-router, redux-thunk.
The logical programming in the backend takes advantage of different data-structures such as priority heaps and search trees.

#
http://rehoboth23.pythonanywhere.com/
#

# Set Up The BackEnd
**virtualenv** [environment name]  
**cd** [environment name]  
**source bin/activate**
**mkdir** src    
**cd** src  
**git clone** [this repository link]  
**cd** chatx/bant   
**pip install  -r requorements.txt**   
**python manage.py makemigrations**  
**python manage.py migrate**

# final steps
in setting.py set host to 127.0.0.1
In comsumers.py set PRE_LINK = **"https://localhost:8000"** and IN_PROD = **False**

# API
**The backend can be tested independently using proper api calls**  
authentication fields for API call:   
create: name, email, password1, password2  
get: email, password  

chat fields for API call:  
create: **Needs Authentication** User, Receiver, memo  
get: **Needs Authentication** can only be done using a request with kwarg ["roomName"] for the room hosting the chat. e.g "<link>/_user1_user2"  

# Run The Backend Without SSL
**python manage.py runserver**

# Run The Backend With SSL
**Note** the front endpoint link for the router has to be reconfigured to **`${proc}//${loc.host}:8001/ws/`**. Run **npm run build** in a seperate terminal to build the static files. run **python manage.py collectstatic**. 
**python manage.py runsslserver [port]**  
OR  
**daphne -e ssl:8000:privateKey=/[Path to site packages]/sslserver/certs/development.crt:certKey=/[Path to site packages]/sslserver/certs/development.key bant.asgi:application**

# To test a local instance of front end in develpoment  
**I would recommend studying the backend and then creating a custom front end to fit the APIs**
!! ensure that you are in the bant folder
**npm create-react-app** [app name]  
**cd app name**  
**rm-r src** 
**cd ../chatx**   
**copy the src folder**
**cd ../app name**  
**paste the src folder**
**rename app name to chatx**  
**Note** The endpoint link for the router (chatx/src/router.js) has to be reconfigured to **`${proc}//localhost:8000/ws/`**  
**Note** The target link for authentication (chatx/store/actions/auth.js) has to be changed to **`http://localhost:8000/authenticate/`**  
Run **npm start** in a seperate terminal window 

# Test The Server STATIC FILES FOR DEPLOYMENT
**Note** An AWS S3 bucket needs to be set up to test the backend. This is because the static files are served from the S3 bucket using boto3  
**Alternatively**, You can reconfigure the static directories IN setting.py file to point to a static folder. It should point to the "public/static" directory of the react app and anyother necessary static directories.





