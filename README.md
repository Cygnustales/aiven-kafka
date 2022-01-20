## Aiven Kafka NodeJS Application Example

### Install
`npm install`

*note: if you having trouble with node-gyp `error` on macOS, just run `node-gyp rebuild` after `npm install` (read **node-gyp error** section below)*

## Run Application
`npm run start`

The Application will run at http://localhost:3000
*note: You can change the port number on `config/config.json` file*

## API
### Create Topic
`method : PUT`

`end point : /topic/create`

Body :
```
{
    "topic": "topic name",
    "partitions": 0,
    "replicationFactor":2
}
```

### Send Topic Data
`method : POST`

`end point : /topic/data`

Body :
```
{
   "topic": "topic name",
   "message": "message body", 
   "partition":0
}
```

### Topic List
`method : GET`

`end point : /topic/list`

### Topic Describe
`method : POST`

`end point : /topic/describe`

Body :
```
{
   "topic": "topic name",
}
```

### View Topic Data
`method : POST`

`end point : /topic/message/`

Body :
```
{
   "topic": "topic name",
}
```

## Node-Gyp Error

Create file name `binding.gyp` at the `root` project and insert this inside the file

```
{
	"targets": [
		{
			"target_name": "binding",
			"sources": [ "build/Release/binding.node" ]
		}
	]
}
```
run `node-gyp rebuild`
