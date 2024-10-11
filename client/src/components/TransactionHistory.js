import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

function TransactionHistory({ transactions }) {
  return (
    <List>
      {transactions.map((txn, index) => (
        <ListItem key={index} sx={{ borderBottom: '1px solid #ddd' }}>
          <ListItemText
            primary={
              <>
                <Typography variant="body1" component="span" sx={{ fontWeight: 'bold' }}>
                  {txn.type === 'transfer' ? 'Transfer' : 'Deposit'} of ${txn.amount}
                </Typography>
                {txn.type === 'transfer' && ` to ${txn.recipientId}`}
              </>
            }
            secondary={`Date: ${txn.date}`}
          />
        </ListItem>
      ))}
    </List>
  );
}

export default TransactionHistory;