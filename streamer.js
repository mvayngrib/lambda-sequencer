const AWS = require('aws-sdk')
AWS.config.update(require('./asw-conf'))
const co = require('co').wrap
const streams = new AWS.DynamoDBStreams()
const db = new AWS.DynamoDB()

co(function* () {
  const desc = yield streams.describeStream({
    StreamArn:
  }).promise()

})()
.catch(console.error)


   /*
   desc = {
    StreamDescription: {
     CreationRequestDateTime: <Date Representation>,
     KeySchema: [
        {
       AttributeName: "ForumName",
       KeyType: "HASH"
      },
        {
       AttributeName: "Subject",
       KeyType: "RANGE"
      }
     ],
     Shards: [
        {
       SequenceNumberRange: {
        EndingSequenceNumber: "20500000000000000910398",
        StartingSequenceNumber: "20500000000000000910398"
       },
       ShardId: "shardId-00000001414562045508-2bac9cd2"
      },
        {
       ParentShardId: "shardId-00000001414562045508-2bac9cd2",
       SequenceNumberRange: {
        EndingSequenceNumber: "820400000000000001192334",
        StartingSequenceNumber: "820400000000000001192334"
       },
       ShardId: "shardId-00000001414576573621-f55eea83"
      },
        {
       ParentShardId: "shardId-00000001414576573621-f55eea83",
       SequenceNumberRange: {
        EndingSequenceNumber: "1683700000000000001135967",
        StartingSequenceNumber: "1683700000000000001135967"
       },
       ShardId: "shardId-00000001414592258131-674fd923"
      },
        {
       ParentShardId: "shardId-00000001414592258131-674fd923",
       SequenceNumberRange: {
        StartingSequenceNumber: "2574600000000000000935255"
       },
       ShardId: "shardId-00000001414608446368-3a1afbaf"
      }
     ],
     StreamArn: "arn:aws:dynamodb:us-west-2:111122223333:table/Forum/stream/2015-05-20T20:51:10.252",
     StreamLabel: "2015-05-20T20:51:10.252",
     StreamStatus: "ENABLED",
     StreamViewType: "NEW_AND_OLD_IMAGES",
     TableName: "Forum"
    }
   }
   */
