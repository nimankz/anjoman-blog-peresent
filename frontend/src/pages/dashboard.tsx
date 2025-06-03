import { Box, Button } from '@mantine/core';

export default function Dashboard() {
  return (
    <Box ta="center">
      Welcome to dashboard

      <Box mt="xl">
        <Button mr="xs">Create Event</Button>
        <Button mr="xs">Create Announcement</Button>
        <Button>Create Article</Button>
      </Box>
    </Box>
  );
}
