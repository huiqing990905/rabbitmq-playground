const TOPOLOGIES = {
  default: {
    exchange: { name: '(Default)', type: 'direct' },
    bindings: [
      { bindingKey: 'simple-queue', queue: 'simple-queue', consumer: 'SimpleConsumer' },
    ],
  },
  direct: {
    exchange: { name: 'direct-ex', type: 'direct' },
    bindings: [
      { bindingKey: 'pay.alipay', queue: 'alipay-queue', consumer: 'AlipayConsumer' },
      { bindingKey: 'pay.wechat', queue: 'wechat-queue', consumer: 'WechatConsumer' },
    ],
  },
  topic: {
    exchange: { name: 'topic-ex', type: 'topic' },
    bindings: [
      { bindingKey: '*.error', queue: 'error-queue', consumer: 'ErrorConsumer' },
      { bindingKey: 'order.*', queue: 'order-log-queue', consumer: 'OrderLogConsumer' },
      { bindingKey: '#', queue: 'all-log-queue', consumer: 'AllLogConsumer' },
    ],
  },
  fanout: {
    exchange: { name: 'fanout-ex', type: 'fanout' },
    bindings: [
      { bindingKey: '(all)', queue: 'notify-sms-queue', consumer: 'SmsConsumer' },
      { bindingKey: '(all)', queue: 'notify-email-queue', consumer: 'EmailConsumer' },
      { bindingKey: '(all)', queue: 'notify-push-queue', consumer: 'PushConsumer' },
    ],
  },
};

function topicMatch(routingKey, bindingKey) {
  if (bindingKey === '#') return true;

  const routingParts = routingKey.split('.');
  const bindingParts = bindingKey.split('.');

  let ri = 0;
  let bi = 0;

  while (bi < bindingParts.length) {
    const bp = bindingParts[bi];

    if (bp === '#') {
      if (bi === bindingParts.length - 1) return true;
      bi++;
      const nextBp = bindingParts[bi];
      while (ri < routingParts.length) {
        if (routingParts[ri] === nextBp || nextBp === '*') {
          break;
        }
        ri++;
      }
      if (ri >= routingParts.length) return false;
    } else if (bp === '*') {
      if (ri >= routingParts.length) return false;
      ri++;
      bi++;
    } else {
      if (ri >= routingParts.length || routingParts[ri] !== bp) return false;
      ri++;
      bi++;
    }
  }

  return ri === routingParts.length;
}

export function predictMatches(exchangeType, routingKey) {
  if (!routingKey && exchangeType !== 'fanout') return [];

  const topology = TOPOLOGIES[exchangeType];
  if (!topology) return [];

  if (exchangeType === 'fanout') {
    return topology.bindings.map((b) => b.queue);
  }

  if (exchangeType === 'default') {
    return topology.bindings
      .filter((b) => b.bindingKey === routingKey)
      .map((b) => b.queue);
  }

  if (exchangeType === 'direct') {
    return topology.bindings
      .filter((b) => b.bindingKey === routingKey)
      .map((b) => b.queue);
  }

  if (exchangeType === 'topic') {
    return topology.bindings
      .filter((b) => topicMatch(routingKey, b.bindingKey))
      .map((b) => b.queue);
  }

  return [];
}

export function explainMatch(exchangeType, routingKey, bindingKey) {
  if (exchangeType === 'fanout') return 'Fanout broadcasts to all queues';
  if (exchangeType === 'default') {
    return routingKey === bindingKey
      ? `"${routingKey}" = queue name`
      : `"${routingKey}" != queue name "${bindingKey}"`;
  }
  if (exchangeType === 'direct') {
    return routingKey === bindingKey
      ? `"${routingKey}" exactly matches "${bindingKey}"`
      : `"${routingKey}" != "${bindingKey}"`;
  }
  if (exchangeType === 'topic') {
    const matched = topicMatch(routingKey, bindingKey);
    if (bindingKey === '#') return matched ? `"#" matches everything` : '';
    if (bindingKey.includes('*')) {
      const routingParts = routingKey.split('.');
      const bindingParts = bindingKey.split('.');
      if (matched) {
        const explanations = bindingParts.map((bp, i) => {
          if (bp === '*') return `* matches "${routingParts[i] || '?'}"`;
          return `"${bp}" = "${routingParts[i] || '?'}"`;
        });
        return explanations.join(', ');
      }
      return `Pattern "${bindingKey}" does not match "${routingKey}"`;
    }
    return matched ? `exact match` : `no match`;
  }
  return '';
}

export { TOPOLOGIES };
