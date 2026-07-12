import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

export default function OkkaPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Okka and Clans of Anjigeri Naad
      </Typography>
      <Typography paragraph>
        Okka represents the Kodava clan system, with shared ancestry, family halls, and ancestral worship at the center of community life.
      </Typography>

      <Typography variant="h5" gutterBottom>
        What is Okka?
      </Typography>
      <Typography paragraph>
        In Kodava society, an okka is a lineage group that traces its members back to a common ancestor. Okka traditions preserve family names, rituals, and collective responsibility.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Key Okka Values
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Ancestral respect" secondary="Families maintain their ainmane and observe ceremonies together." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Unity" secondary="Okka members support one another during festivals, weddings, and community events." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Tradition" secondary="Cultural practices, language, dress, and food are passed across generations." />
        </ListItem>
      </List>

      <Typography variant="h5" gutterBottom>
        Clan Heritage
      </Typography>
      <Typography paragraph>
        Clans in Anjigeri Naad share rituals, names, and social bonds. Each okka has a special role in local festivals and maintains family heritage through storytelling and temple duties.
      </Typography>
    </Box>
  );
}
