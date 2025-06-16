import React, { useState } from 'react';
import axios from 'axios';

const TrackShipment = ({ token }) => {
  const [trackingId, setTrackingId] = useState('');
  const [shipmentStatus, setShipmentStatus] = useState(null);

  const handleTrackShipment = async (e) => {
    e.preventDefault();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    try {
      const res = await axios.get(`/api/tracking/shipments/${trackingId}`, { headers });
      setShipmentStatus(res.data);
    } catch (err) {
      setShipmentStatus({ error: err.response?.data?.error || 'Failed to track shipment.' });
    }
  };

  const renderEvents = (events) => (
    <ul className="shipment-events">
      {events.map((event, index) => (
        <li key={index}>
          <strong>{event.timestamp}:</strong> {event.description} ({event.location})
        </li>
      ))}
    </ul>
  );

  return (
    <div className="track-container">
      <h1>Track Your Shipment</h1>
      <form className="track-form" onSubmit={handleTrackShipment}>
        <input
          type="text"
          className="track-input"
          placeholder="Enter your tracking number..."
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          required
        />
        <button type="submit" className="track-button">Track</button>
      </form>
      {shipmentStatus && (
        <div className="shipment-details">
          {shipmentStatus.error ? (
            <p className="status-error">{shipmentStatus.error}</p>
          ) : (
            <>
              <h3>Shipment Status: {shipmentStatus.status}</h3>
              <p><strong>Current Location:</strong> {shipmentStatus.location}</p>
              {shipmentStatus.recipient && (
                <>
                  <p><strong>Recipient:</strong> {shipmentStatus.recipient}</p>
                  <p><strong>Address:</strong> {shipmentStatus.address}</p>
                  <h4>Tracking History:</h4>
                  {renderEvents(shipmentStatus.events)}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackShipment;