# DOCKER runing node server setup:

1. sudo docker build -t <container-name> .
   ex: sudo docker build -t loan-management-test .

2. sudo docker run -p recieving_port : 1234 <container-name>

# DOCKER test case runnig setup:

1. sudo docker run loan-management-test npm run test -t "test/IntegrationTest/routes/user.test.js" -- for testing user Integration test
2. sudo docker run loan-management-test npm run test -t "test/IntegrationTest/routes/loan.test.js" -- for testing loan Integration test
3. sudo docker run loan-management-test npm run test -t "test/UnitTest/models/loan.test.js" -- for testing loan Unit test
4. sudo docker run loan-management-test npm run test -t "test/UnitTest/models/user.test.js" -- for testing user Unit Testing
5. sudo docker run loan-management-test npm run test -t "test/IntegrationTest/middleware/auth.test.js" -- for testing auth middleware
6. sudo docker run loan-management-test npm run test -t "test/IntegrationTest/middleware/permission.test.js" -- for testing permission middleware
7. sudo docker run loan-management-test npm run test -t "test/IntegrationTest/middleware/authorization.test.js" --for testing authorization middleware
