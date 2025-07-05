import React, { useState } from 'react';
import axios from 'axios';

// Yeni prop'ları alıyoruz: trackTitle, trackPlaceholder, trackButton
const TrackShipment = ({ token, trackTitle, trackPlaceholder, trackButton }) => {
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
      {events && events.map((event, index) => (
        <li key={index}>
          <strong>{event.timestamp}:</strong> {event.description} ({event.location})
        </li>
      ))}
    </ul>
  );

  return (
    <div className="track-container">
      {/* Statik metin yerine prop'ları kullanıyoruz */}
      <h1>{trackTitle}</h1>
      <form className="track-form" onSubmit={handleTrackShipment}>
        <input
          type="text"
          className="track-input"
          placeholder={trackPlaceholder}
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          required
        />
        <button type="submit" className="track-button">{trackButton}</button>
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