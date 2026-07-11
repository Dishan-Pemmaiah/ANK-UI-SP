import { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { HubConnectionBuilder } from '@microsoft/signalr';

export default function LivePage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_API_BASE || 'http://localhost:5126'}/livehub`)
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      connection.on('ReceiveLiveUpdate', (message) => {
        setMessages((prev) => [message, ...prev]);
      });
    });

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Live Match Updates</Typography>
      <Paper sx={{ p: 3 }}>
        {messages.length === 0 ? (
          <Typography>No live updates yet.</Typography>
        ) : (
          messages.map((message, index) => (
            <Typography key={index} sx={{ mb: 2 }}>{message}</Typography>
          ))
        )}
      </Paper>
    </Box>
  );
}
