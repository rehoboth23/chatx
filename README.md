# chatx
ChatX is an instant messaging web application providing real-time communication and updates between the server and client ends using web sockets and a Rest API.  
The backend is built using Django-Rest framework, and the sockets are integrated using Channels. The front end is built using primarily using React. It is integrated with React-Redux primarily for authentication purposes and to maintain web socket information. It also makes extensive use of other react libraries e.g. axios, react-router, redux-thunk.
The logical programming in the backend takes advantage of different data-structures such as priority heaps and search trees.

#
http://rehoboth23.pythonanywhere.com/
#

# Set Up BackEnd
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
  

# Test Server
!!Note an AWS S3 bucket needs to be set up to test the backend. This is because the static files are served from the S3 bucket using boto3   
# Without SSL

**python manage.py runserver**

# With SSL
**python manage.py runsslserver [port]**
**daphne -e ssl:8000:privateKey=/[Path to site packages]/sslserver/certs/development.crt:certKey=/[Path to site packages]/sslserver/certs/development.key bant.asgi:application**. 


# To test front end
!! ensure that you are in the bant folder
**npm create-react-app** [app name]  
**cd app name**  
**rm-r src**   
**cd ../chatx**   
**copy the src folder**  
**cd ../app name**  
**paste the src folder** 
rename app name to chatx


# final steps
in router in chatx/src, set the enpoint value of the socket to the second option and comment out the first i.e. set the endpoint or url to localhost
do the same for all js file of comonents and store

in consumers.py set PRE_LINK to point to localhosy. 
in setting.py set host to 127.0.0.1. 





