var express = require('express');
var router = express.Router();
var kafka = require('../modules/kafka');

router.put('/topic/create/', kafka.createTopics);
router.post('/topic/data/', kafka.sendDataToTopics);
router.post('/topic/describe/', kafka.describeTopicConfig);
router.post('/topic/message/', kafka.consumer);

module.exports = router;