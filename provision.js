const AWS = require('aws-sdk')
AWS.config.update(require('./aws-conf'))
const co = require('co').wrap
const config = require('./default-config')
const db = new AWS.DynamoDB()
const lambda = new AWS.Lambda()
const QueueItemsTableParams = {
  TableName: 'QueueItems',
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" }
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "queueId", AttributeType: "S" },
    { AttributeName: "queueSeq", AttributeType: "N" }
  ],
  GlobalSecondaryIndexes: [
    {
      "IndexName": "seqInQueue",
      "KeySchema": [
        { "AttributeName": "queueId", "KeyType": "HASH" },
        { "AttributeName": "queueSeq", "KeyType": "RANGE" },
      ],
      "Projection": {
        "ProjectionType": "ALL"
      },
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5
      }
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: 'NEW_AND_OLD_IMAGES'
  }
}

const CursorsTableParams = {
  TableName: 'Cursors',
  KeySchema: [
    { AttributeName: "queue", KeyType: "HASH" },
    { AttributeName: "seq", KeyType: "RANGE" }
  ],
  AttributeDefinitions: [
    { AttributeName: "queue", AttributeType: "S" },
    { AttributeName: "seq", AttributeType: "N" }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: 'NEW_AND_OLD_IMAGES'
  }
}

co(function* () {
  const { TableNames } = yield db.listTables().promise()
  if (!TableNames.includes('QueueItems')) {
    yield db.createTable(QueueItemsTableParams).promise()
  }

  if (!TableNames.includes('Cursors')) {
    yield db.createTable(CursorsTableParams).promise()
  }

  // yield IAM.createRole({

  // })

  const FunctionName = 'Sequencer'
  const functionExists = yield lambda.getFunction({ FunctionName }).promise()
  if (!functionExists) {
    const data = fs.readFileSync('./sequencer.zip')
    lambda.createFunction({
      Code: {
        ZipFile: data // buffer with the zip file data
      },
      FunctionName, // functionName was set in the constants in step 1
      Handler: 'sequencer.handler',
      Role: IAMRole,  // IAMRole was set in the constants in step 1
      Runtime: 'nodejs'
      ZipFile: `fileb://${}`
    })
  }

  aws lambda create-function \
    --region us-east-1 \
    --function-name publishNewBark \
    --zip-file fileb://publishNewBark.zip \
    --role arn:aws:iam::210041114155:role/service-role/WooferLambdaRole \
    --handler publishNewBark.handler \
    --timeout 5 \
    --runtime nodejs6.10

})()
.catch(console.error)

// QueueItems: arn:aws:dynamodb:ddblocal:000000000000:table/QueueItems/stream/2017-05-24T18:51:55.968
// Cursors:    arn:aws:dynamodb:ddblocal:000000000000:table/Cursors/stream/2017-05-24T18:53:40.869
//
