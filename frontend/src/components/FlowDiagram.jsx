import { useState, useEffect } from 'react';
import { TOPOLOGIES, explainMatch } from '../utils/matchRoutingKey';

export default function FlowDiagram({ exchangeType, routingKey, predictedQueues, lastMessage }) {
  const [confirmedQueues, setConfirmedQueues] = useState(new Set());
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.exchangeType !== exchangeType) return;

    setConfirmedQueues((prev) => new Set([...prev, lastMessage.queue]));
    setConfirmed(true);

    const timer = setTimeout(() => {
      setConfirmedQueues(new Set());
      setConfirmed(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [lastMessage]);

  useEffect(() => {
    setConfirmedQueues(new Set());
    setConfirmed(false);
  }, [exchangeType]);

  const topology = TOPOLOGIES[exchangeType];
  const predictedSet = new Set(predictedQueues);
  const hasPrediction = predictedQueues.length > 0 || routingKey;

  return (
    <div className="flow-diagram-wrapper">
      {/* Status banner */}
      {confirmed && confirmedQueues.size > 0 && (
        <div className="flow-result confirmed">
          Delivered to {confirmedQueues.size} queue{confirmedQueues.size > 1 ? 's' : ''}
        </div>
      )}
      {!confirmed && hasPrediction && (
        <div className="flow-result predicted">
          {predictedQueues.length > 0
            ? `Prediction: ${predictedQueues.length} queue${predictedQueues.length > 1 ? 's' : ''} will match`
            : 'Prediction: no queues will match'}
        </div>
      )}

      <div className="flow-diagram">
        {/* Producer */}
        <div className="flow-column producer-col">
          <div className={`flow-node producer ${confirmed ? 'pulse' : ''}`}>
            <div className="node-icon">P</div>
            <div className="node-label">Producer</div>
          </div>
        </div>

        <div className="flow-connector">
          <div className={`connector-line ${confirmed ? 'confirmed' : ''}`} />
        </div>

        {/* Exchange */}
        <div className="flow-column exchange-col">
          <div className={`flow-node exchange ${confirmed ? 'pulse' : ''}`}>
            <div className="node-icon">E</div>
            <div className="node-label">{topology.exchange.name}</div>
            <div className="node-type">{topology.exchange.type}</div>
          </div>
        </div>

        {/* Routes */}
        <div className="flow-routes">
          {topology.bindings.map((b, i) => {
            const isPredicted = predictedSet.has(b.queue);
            const isConfirmed = confirmedQueues.has(b.queue);
            const explanation = hasPrediction
              ? explainMatch(exchangeType, routingKey, b.bindingKey)
              : '';

            let state = '';
            if (isConfirmed) state = 'confirmed';
            else if (isPredicted && !confirmed) state = 'predicted';
            else if (hasPrediction && !isPredicted) state = 'dimmed';

            return (
              <div key={i} className={`flow-route ${state}`}>
                <div className={`route-line ${state}`}>
                  <span className="binding-label">{b.bindingKey}</span>
                </div>
                <div className={`flow-node queue ${state}`}>
                  <div className="node-icon">Q</div>
                  <div className="node-label">{b.queue}</div>
                </div>
                <div className={`route-line-right ${state}`} />
                <div className={`flow-node consumer-node ${state}`}>
                  <div className="node-icon">C</div>
                  <div className="node-label">{b.consumer}</div>
                </div>
                {hasPrediction && (
                  <div className="route-info">
                    <span className={`match-badge ${isPredicted || isConfirmed ? 'yes' : 'no'}`}>
                      {isPredicted || isConfirmed ? 'MATCH' : 'NO MATCH'}
                    </span>
                    {explanation && (
                      <span className="match-reason">{explanation}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
