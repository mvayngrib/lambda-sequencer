const AWS = require('aws-sdk')
const co = require('co').wrap
const debug = require('debug')('lambda-sequencer')
const { marshalItem, unmarshalItem } = require('dynamodb-marshaler')
const wrap = require('./wrap')
const db = new AWS.DynamoDB.DocumentClient()
const DEFAULT_CONFIG = require('./default-config')

// TODO: figure out how this will be supplied
const {
  itemsTableName,
  cursorsTableName,
  queuePositionIndex,
  queueIdAttr,
  queueSeqAttr,
  idAttr
} = DEFAULT_CONFIG

exports.handler = wrap.generator(function* (event, context) {
  const { Records } = event
  const items = event.Records.map(record => unmarshalItem(record.dynamodb))
  const queues = groupBy(items, getQueueId)
  for (let queue in queues) {
    let items = sortBy(queues[queue], getItemSeq)
    yield processItems({ queue, items })
  }
})

const processItems = co(function* ({ queue, items }) {
  for (const item of items) {
    let seq = getItemSeq(item)
    // todo: cache
    const lastSeq = yield getLastSeq({ queue })
    if (seq !== lastSeq + 1) {
      // as items are sorted, we can skip the rest too
      debug('received out-of-order item, skipping for now')
      return
    }

    let next
    let id
    do {
      id = item.id
      // trigger cursor table stream event
      debug(`updating cursor, queue ${queue}, seq: ${seq}`)
      yield updateCursor({ queue, seq, id })
      next = yield getItemBySeq({ queue, seq: ++seq })
    } while (next)
  }
})

function groupBy (items, getGroup) {
  const groups = {}
  for (const item of items) {
    groups[getGroup(item)] = item
  }

  return groups
}

function sortBy (items, getSeq) {
  return items.sort(function (a, b) {
    return getSeq(a) - getSeq(b)
  })
}

function getItemBySeq ({ queue, seq }) {
  return db.query({
    TableName: itemsTableName,
    IndexName: queuePositionIndex,
    KeyConditionExpression: '#queueId = :queueValue and #queueSeq = :seqValue',
    ExpressionAttributeNames: {
      "#queueId": 'queueId',
      "#queueSeq": 'queueSeq'
    },
    ExpressionAttributeValues: {
      ":queueValue": queue,
      ":seqValue": seq
    }
  })
  .promise()
}

function updateCursor ({ queue, seq, id }) {
  return db.put({
    TableName: cursorsTableName,
    Key: { queue },
    Item: { seq, id }
  })
  .promise()
}

function getLastSeq ({ queue }) {
  return db.get({
    TableName: cursorsTableName,
    Key: { queue }
  })
  .promise()
}

function getQueueId (item) {
  return item[queueIdAttr]
}

function getItemSeq (item) {
  return item[queueSeqAttr]
}
