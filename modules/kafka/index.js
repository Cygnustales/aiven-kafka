const fs = require('fs');
const crypto = require('crypto');
const kafkaClientOptions = {
    kafkaHost: 'public-kafka-test01-bdkusuma-c8f2.aivencloud.com:17770',
    ssl: true,
    sslOptions: {
        key:fs.readFileSync('cert/service.key','utf8'),
        cert: fs.readFileSync('cert/service.cert','utf8'),
        ca: fs.readFileSync('cert/ca.pem','utf8'),
        rejectUnauthorized: false
    }
  };

const kafka = require('kafka-node'),
    HighLevelProducer = kafka.HighLevelProducer,
    client = new kafka.KafkaClient(kafkaClientOptions)
    producer = new HighLevelProducer(client)


function sendDataToTopics(req, res) {
    const date = new Date();
    const uuid = crypto.randomBytes(20).toString('hex');
    const Producer = kafka.Producer,
    client = new kafka.KafkaClient(kafkaClientOptions),
    producer = new Producer(client),
    payloads = [
        { topic: req.body.topic, 
          messages:JSON.stringify(req.body.message), 
          key: uuid,
          partition: req.body.partition,
          timestamp: Date.now(),
          attributes: 1
        }
    ];
    
    producer.on('ready', function () {
        producer.send(payloads, function (err, data) {
                res.status(200)
                .json({
                    status: 'success',
                    data: data
                })
        });
    });

    producer.on('error', function (err) {
        const log = [{ "topic": "__error_log", "messages": err,"partition": 0}]
        errorLogging(log)
    })

}

function consumer(req, res) {
    var Consumer = kafka.Consumer;
    var Offset = kafka.Offset;
    var Client = kafka.KafkaClient;
    var topic = req.body.topic;
    var partition = req.body.partition;
    var groupId = req.body.groupId;
    var client = new Client(kafkaClientOptions);
    var topics = [{ topic: topic, partition: partition }];
    var options = { groupId: groupId, autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };

    var consumer = new Consumer(client, topics, options);
    var offset = new Offset(client);
    
    offset.fetchLatestOffsets([topic], function (error, offsets) {
		if (error)
			return handleError(error);

        var Latest = offsets[topic][partition];
        
        offset.fetchEarliestOffsets([topic], function (error, offsets) {
            if (error)
                return handleError(error);
            
            var Earliest = offsets[topic][partition];
            var TotalOffset = Latest - Earliest;
            
            const temp = [];
            consumer.on('message', function (message) {
                
                const count = Latest -1                
                const current = message.offset;
                if(!message){
                    console.log('none')
                }
                if(current != Latest){
                    temp.push(message)
                }
                if(count == current){
                    res.status(200)
                    .json({
                        status: 'success',
                        total: Latest, 
                        data: temp
                    })
                }

                
            });
            consumer.on('error', function (err) {
                console.log('error', err);
                const log = [{ "topic": "__error_log", "messages": err,"partition": 0}]
                errorLogging(log)
            });

        }); 
	});
}


function describeTopicConfig (req, res) {

    const admin = new kafka.Admin(client);
    const resource = {
        resourceType:  admin.RESOURCE_TYPES.topic, 
        resourceName: req.body.topic,
        configNames: []          
      }
      
      const payload = {
        resources: [resource],
        includeSynonyms: false  
      };
      
      admin.describeConfigs(payload, (err, result) => {
        if(err){
            const log = [{ "topic": "__error_log", "messages": err,"partition": 0}]
            errorLogging(log)
            return console.error(err);
        }
        res.status(200)
            .json({
                status: 'success',
                data: result
            })
      })
    
}



function topicList(req, res) {
    const admin = new kafka.Admin(client);
    admin.listTopics((err, result) => {
        if(err){
            const log = [{ "topic": "__error_log", "messages": err,"partition": 0}]
            errorLogging(log)
            return console.error(err);
        }
        if(!result){}else{
            let array = [Object.keys(result[1].metadata)]
            const topiclisting = array[0]
        res.status(200)
            .json({
                status: 'success',
                data: topiclisting
            })
        }
        
    });
}


function errorLogging(log) {
    Producer = kafka.Producer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.KafkaClient(),
    producer = new Producer(client),
    km = new KeyedMessage('key', 'message'),
    payloads = [log];
    producer.on('ready', function () {
        producer.send(payloads, function (err, data) {
            console.log(data);
        });
    });
    producer.on('error', function (err) {
        console.log('error', err);
        const log = [{ "topic": "__error_log", "messages": err,"partition": 0}]
        errorLogging(log)
    })

}

module.exports = {
    sendDataToTopics:sendDataToTopics,
    consumer:consumer,
    describeTopicConfig:describeTopicConfig,
    topicList:topicList,
    errorLogging:errorLogging
}