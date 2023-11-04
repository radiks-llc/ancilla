# Deploy at the speed of rad!

An ML Infra Framework/Orchestrator thing

## Disclaimer: I have no idea what I'm doing

## Motivation

Deploying ML models nicely is difficult.

- Inference code is often tied to a infra provider (bad)
- Building ML images on Mac without a base image sucks
- Inputs/outputs for each model varies widely
- Inference code and business logic end up being colocated (bad)

There should be a framework where we can separate inference from business logic and deploy easily.

## Constraints

1. Don’t worry about generalizing deployment
2. Don’t worry about separating business logic vs. inference just yet
3. Don’t worry about progress indicators just yet
4. Don’t worry about generalized outputs

## Goal

1. Deploy 3 ML models
    1. An LLM
    2. A 2D image thing
    3. A heavy 3D thing
2. Prompts should go to the same place
    1. Some kind of API endpoint
    2. `POST /run` either returns streaming HTTP or an HTTP response
3. You should see a list of previous prompts in a console
