#Rena

Project Rena is an online 2D drawing tool with dimensions and constraints capability. 

Please see a live demo here: [http://rena-kdict.rhcloud.com/](http://rena-kdict.rhcloud.com/)

Currently it supports drawing line, rectangle, circle/ellipse and adding distance-point-line constraint. And it's easy to extend to other geometry and constraint types. It also supports geometry dragging.

The project includes a simple geometric constraint solver written in javascript, which is based on a Newton equation solver, implemented on top of [numeric] (https://github.com/sloisel/numeric).

###To run it on your local machine
1. Install Node.js
2. Download source code.
3. Go to the Rena/Source folder, and execute the following command:

```
npm install .
npm run start
localhost:8080
```
