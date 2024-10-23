provider "aws" {
  access_key = "test"
  secret_key = "test"
  region     = "us-east-1"

  endpoints {
    sns = "http://localstack:4566"
    sqs = "http://localstack:4566"
  }

  skip_credentials_validation = true
  skip_metadata_api_check    = true
  skip_requesting_account_id = true
}

# Main SQS Queue
resource "aws_sqs_queue" "test_queue" {
  name = "test-messages"
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.test_dlq.arn
    maxReceiveCount     = 3
  })
}

# Dead Letter Queue
resource "aws_sqs_queue" "test_dlq" {
  name = "test-messages-dlq"
}

# SNS Topic
resource "aws_sns_topic" "test_topic" {
  name = "test"
}

# SNS Topic Subscription
resource "aws_sns_topic_subscription" "test_subscription" {
  topic_arn = aws_sns_topic.test_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.test_queue.arn
}

# SQS Queue Policy
resource "aws_sqs_queue_policy" "test_queue_policy" {
  queue_url = aws_sqs_queue.test_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = "sqs:SendMessage"
        Resource = aws_sqs_queue.test_queue.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn": aws_sns_topic.test_topic.arn
          }
        }
      }
    ]
  })
}
