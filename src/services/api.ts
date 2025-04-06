export async function sendMessageToWebhook(message: string, userId: string, apiUrl: string): Promise<string> {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, user_id: userId }),
  });
  if (!response.ok) {
    throw new Error("Failed to send message to webhook");
  }
  const data = await response.json();
  return data.response;
}
