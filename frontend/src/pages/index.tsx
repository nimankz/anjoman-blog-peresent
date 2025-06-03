import { Box, Button, Anchor } from '@mantine/core';
import { Welcome } from '@/components/Welcome/Welcome';

export default function HomePage() {
  return (
    <Box ta="center">
      <Welcome />
      <Anchor href="/login">
        <Button variant="filled">Get Started</Button>
      </Anchor>
    </Box>
  );
}
