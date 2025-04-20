import axios from 'axios';


type ToolRequest = {
    command: string;
    body: any;
  };

export async function makepollingRequest({
    command,
    body,
  }: ToolRequest): Promise<any> {
    const pollingIntervalMs = 5000; // 5 seconds
    const totalTimeoutMs = 50 * 60 * 1000; // 50 minutes
    const maxRetries = Math.floor(totalTimeoutMs / pollingIntervalMs);
  
    const startTime = Date.now();
    let retries = 0;
  
    while (retries < maxRetries) {
      try {
        const response = await axios.post(
          'https://api.sandbox.paypal.com/v1/mfsauth/user/generate-challenge',
          body,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': 'Basic QVY5QThoQzlpdG4zUnBaLU9lU05LcTNPczl1NjBIbUZpMFIzS0NfQVlTWVlLd1AxbUhWSEJYREpJVDdpOg==',
            },
            timeout: 10000, // 10 second timeout per request
          }
        );
  
        const responseData = response.data;
  
        // Check if the server response indicates completion
        const status = responseData?.status?.toLowerCase(); // <-- always normalize to lowercase
        if (status && status !== 'inprogress') {
          // Completed successfully
          return {
            content: [
              {
                type: "text",
                text: { message: 'Completed', data: responseData },
              },
            ],
          };
        }
  
      } catch (error: any) {
        if (error.response) {
          const status = error.response.status;
  
          // Fail immediately on client errors
          if (status >= 400 && status < 500) {
            console.error('Client error:', status);
            return {
              content: [
                {
                  type: "text",
                  text: { message: `Client Error ${status}`, error: error.message },
                },
              ],
            };
          }
  
          // Retry on server errors
          console.warn('Server error, will retry:', status);
        } else {
          console.warn('Network error, will retry:', error.message);
        }
      }
  
      retries++;
  
      const elapsed = Date.now() - startTime;
      if (elapsed >= totalTimeoutMs) {
        console.error('Polling timeout reached.');
        return {
          content: [
            {
              type: "text",
              text: { message: 'Timeout reached after 50 minutes.' },
            },
          ],
        };
      }
  
      // Sleep before polling again
      await sleep(pollingIntervalMs);
    }
  
    // Exhausted retries
    return {
      content: [
        {
          type: "text",
          text: { message: 'Polling retries exhausted without completion.' },
        },
      ],
    };
  }
  
  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }