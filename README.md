# Inside Out Commerce
Inside Out Commerce is a project that demos the "Turning the database inside out" architecture with AWS Serverless techs. 

## Overview
The Inside Out Commerce project aims to demonstrate a novel approach to building scalable and flexible applications by adopting the "Turning the database inside out" architecture. This architecture paradigm is a micro-service architecture that aims to maximally decouple services from each other while providing uniform state sharing mechanisms via Event Carried State Transfer on compacted Kafka topics.

It uses typescript, serverless compute and state stores, and terraform for provisioning


## Event Carried State Transfer on Kafka
Event-carried state transfer refers to the process of transferring and synchronizing the state of an entity or system through events. In the context of Kafka topics, this approach involves publishing events that represent changes to the entire state of an entity, as well as some event context that describes the event that has triggered the state update. These events are consumed and processed by interested subscribers.

When implementing event carried state transfer on Kafka topics, we key the events by the entity ID. This means that events related to the same entity will have the same key, allowing Kafka to ensure that events with the same key are always delivered to the same partition. This is important for maintaining order and consistency when processing events for a specific entity.

We configure [compaction](https://developer.confluent.io/courses/architecture/compaction/) on the Kafka topics to enhance the state transfer mechanism. Compaction ensures that only the latest event with a specific key is retained in the topic, discarding older events with the same key.

We use a transactional outbox pattern to ensure atomicity between microservice data store writes and Kafka event publishing. When using DynamoDB, this is implemented using DynamoDB Streams

## Folder Structure
```markdown
/
  /infra/
    /environment  <- Global infrastructure used by multiple services
    /modules      <- Common TF modules used by multiple services
  /packages       <- Common packages used across services
  /patches        <- `pnpm patch` patches. ATM used for hacking react-auth0 to work with Cognito
  /services/**/*  <-  All micro-services and UIs
```