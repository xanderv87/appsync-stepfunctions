import {AWS} from "@serverless/typescript";

const serverlessConfiguration: AWS & { stepFunctions: any } = {
    service: "appsync-stepfunctions",
    frameworkVersion: "3",
    provider: {
        name: "aws",
        runtime: "nodejs14.x",
        region: "eu-central-1"
    },
    plugins: [
        "serverless-appsync-plugin",
        "serverless-step-functions"
    ],
    functions: {
    },
    stepFunctions: {
        stateMachines: {
            helloWorld: {
                id: "HelloWorldStateMachine",
                name: "helloWorld",
                definition: require('./stepfunction/statemachine.json')
            }
        }
    },
    custom: {
        appSync: {
            authenticationType: "API_KEY",
            schema: [
                "appsync/schema/stepfunctions.graphql",
                "appsync/schema/schema.graphql"
            ],
            mappingTemplatesLocation: "appsync/mapping-templates",
            mappingTemplates: [
                {
                    dataSource: "StepfunctionApiEndpoint",
                    type: "Query",
                    field: "listExecutions",
                    substitutions: {
                        stepfunctionArn: { 'Fn::GetAtt': ['HelloWorldStateMachine', 'Arn'] }
                    }

                },
                {
                    dataSource: "StepfunctionApiEndpoint",
                    type: "StepfunctionExecution",
                    field: "history",
                    substitutions: {
                        stepfunctionArn: { 'Fn::GetAtt': ['HelloWorldStateMachine', 'Arn'] }
                    }

                },
                {
                    dataSource: "StepfunctionApiEndpoint",
                    type: "Mutation",
                    field: "startExecution",
                    substitutions: {
                        stepfunctionArn: { 'Fn::GetAtt': ['HelloWorldStateMachine', 'Arn'] }
                    }

                }
            ],
            dataSources: [
                {
                    type: "HTTP",
                    name: "StepfunctionApiEndpoint",
                    config: {
                        endpoint: "https://states.${self:provider.region}.amazonaws.com/",
                        authorizationConfig: {
                            authorizationType: "AWS_IAM",
                            awsIamConfig: {
                                signingRegion: "${self:provider.region}",
                                signingServiceName: "states"
                            }
                        },
                        iamRoleStatements: [
                            {
                                Effect: "Allow",
                                Action: [
                                    "states:ListExecutions",
                                    "states:StartExecution",
                                    "states:GetExecutionHistory"
                                ],
                                Resource: { 'Fn::GetAtt': ['HelloWorldStateMachine', 'Arn'] }
                            }
                        ]
                    }
                }
            ]
        }
    }
}


module.exports = serverlessConfiguration;
