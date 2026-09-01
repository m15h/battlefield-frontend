import { useState, type FormEvent } from "react";
import { useApiTesterMutation } from "./mutations/apiTesterMutation";

export function APITester() {
  const [response, setResponse] = useState("");

  const { mutate } = useApiTesterMutation({
    onSuccess: (data) => setResponse(JSON.stringify(data, null, 2)),
    onError: (error) => setResponse(String(error)),
  });

  const testEndpoint = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    mutate({
      endpoint: formData.get("endpoint") as string,
      method: formData.get("method") as string,
    });
  };

  return (
    <div className="api-tester">
      <form onSubmit={testEndpoint} className="endpoint-row">
        <select name="method" className="method">
          <option value="GET">GET</option>
          <option value="PUT">PUT</option>
        </select>
        <input type="text" name="endpoint" defaultValue="/api/hello" className="url-input" placeholder="/api/hello" />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
      <textarea readOnly value={response} placeholder="Response will appear here..." className="response-area" />
    </div>
  );
}
