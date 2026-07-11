import { Box, Typography, List, ListItem, ListItemText, Grid, Card, CardContent } from '@mui/material';

export default function HeritagePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Heritage of Anjigeri Naad
      </Typography>
      <Typography paragraph>
        Anjigeri Naad is a living archive of Kodava culture and traditions. This page preserves the heritage of our region,
        including traditional attire, festivals, ancestral homes, cuisine, and language.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Kodava Traditions
      </Typography>
      <Typography paragraph>
        The Kodava way of life is centered on family, community participation, and respect for ancestral customs.
        Anjigeri Naad celebrates these values through community programs, folk rituals, and sports.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: '#141414' }}>
            <CardContent>
              <Typography variant="h6">Kodava Attire</Typography>
              <Typography>
                Traditional Kodava clothing includes the distinctive coat-like \'Kupya\' for men and the beautiful Kodava sari for women.
                Festive dress is an important part of weddings, festivals, and community gatherings.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: '#141414' }}>
            <CardContent>
              <Typography variant="h6">Ainmane</Typography>
              <Typography>
                Ainmanes are ancestral homes of Kodava okkas. These homes are cultural centers for family ceremonies, rites,
                and storytelling across generations.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Festivals
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Puthari" secondary="The harvest festival celebrating rice gathering and community thanksgiving." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Kailpodh" secondary="A festival of weapons and sports that honors martial heritage." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Kaveri Sankramana" secondary="A celebration of the river Kaveri, central to Kodava life and culture." />
        </ListItem>
      </List>

      <Typography variant="h5" gutterBottom>
        Language and Cuisine
      </Typography>
      <Typography paragraph>
        Kodava language and cuisine are essential to the culture of Anjigeri Naad. Traditional foods like Kadumbuttu,
        Pandi curry, and Koli curry are shared during festivals and family gatherings.
      </Typography>
    </Box>
  );
}
