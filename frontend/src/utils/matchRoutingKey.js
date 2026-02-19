const TOPOLOGIES = {
  default: {
    exchange: { name: '(Default)', type: 'direct' },
    bindings: [
      { bindingKey: 'ping-queue', queue: 'ping-queue', consumer: 'PingHandler' },
    ],
  },
  direct: {
    exchange: { name: 'direct-ex', type: 'direct' },
    bindings: [
      { bindingKey: 'action.attack', queue: 'attack-queue', consumer: 'AttackHandler' },
      { bindingKey: 'action.heal', queue: 'heal-queue', consumer: 'HealHandler' },
    ],
  },
  topic: {
    exchange: { name: 'topic-ex', type: 'topic' },
    bindings: [
      { bindingKey: '*.critical', queue: 'critical-log', consumer: 'CriticalHandler' },
      { bindingKey: 'player.*', queue: 'player-log', consumer: 'PlayerHandler' },
      { bindingKey: '#', queue: 'world-log', consumer: 'WorldHandler' },
    ],
  },
  fanout: {
    exchange: { name: 'fanout-ex', type: 'fanout' },
    bindings: [
      { bindingKey: '(all)', queue: 'chat-channel', consumer: 'ChatHandler' },
      { bindingKey: '(all)', queue: 'leaderboard', consumer: 'LeaderboardHandler' },
      { bindingKey: '(all)', queue: 'achievement-tracker', consumer: 'AchievementHandler' },
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
      : `"${routingKey}" != "${bindingKey}"`;
  }
  if (exchangeType === 'direct') {
    return routingKey === bindingKey
      ? `"${routingKey}" exactly matches`
      : `"${routingKey}" != "${bindingKey}"`;
  }
  if (exchangeType === 'topic') {
    const matched = topicMatch(routingKey, bindingKey);
    if (bindingKey === '#') return matched ? `# matches everything` : '';
    if (bindingKey.includes('*')) {
      const routingParts = routingKey.split('.');
      const bindingParts = bindingKey.split('.');
      if (matched) {
        const explanations = bindingParts.map((bp, i) => {
          if (bp === '*') return `* = "${routingParts[i] || '?'}"`;
          return `"${bp}" = "${routingParts[i] || '?'}"`;
        });
        return explanations.join(', ');
      }
      return `"${bindingKey}" doesn't match`;
    }
    return matched ? `exact match` : `no match`;
  }
  return '';
}

export { TOPOLOGIES };
