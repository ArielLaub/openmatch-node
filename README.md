# openmatch-node
an unofficial typescript implementation of the open-match SDK
the open match framework consists of several gRPC services and consumers. A few provided by open-match core installation and others need to be implemented by the game developers. This library provide and typescript API implementing the underlying gRPC and protobuf communication
follow the official docs, the tutorials in this repo are a typescript implementation of the original tutorials written in golang. You can find the original tutorials here:
https://github.com/googleforgames/open-match/tree/main/tutorials

### What is Open Match
Open Match is an open-source game matchmaking framework that simplifies building a scalable and extensible Matchmaker. It is designed to give the game developer full control over how to make matches while removing the burden of dealing with the challenges of running a production service at scale.

### Why Open Match
Building your Matchmaker is hard! Along with implementing the core logic to generate quality matches, it also involves solving challenging problems such as handling massive player populations, effectively searching through them and concurrently processing match generation logic at scale. Open Match framework provides core services that solve these problems so that the game developers can focus on the matchmaking logic to match players into great games.
In comparison to off-the-shelf config based Matchmaking solutions, Open Match enables game developers to easily build a customized Matchmaker that can account for the unique requirements of the game.

The official docs are here:
https://open-match.dev/site/docs/overview/
