# osu-practice-bot
## Setup
- Create podman network<br/>
`podman network create opb-network`

- After editing .envs<br/>
`podman-compose up -d`

### How to apply changes into container 
`podman-compose up -d --build container_name`