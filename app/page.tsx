export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          textAlign: "center",
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          maxWidth: "600px",
        }}
      >
        <h1>City Service Web App</h1>
        <p style={{ fontSize: "16px", color: "#666", marginTop: "10px" }}>
          This is a full-stack application with a Node.js backend and React frontend running separately.
        </p>

        <div
          style={{
            marginTop: "30px",
            textAlign: "left",
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "6px",
          }}
        >
          <h2 style={{ fontSize: "18px", marginTop: 0 }}>To run this app locally:</h2>
          <ol style={{ lineHeight: "1.8" }}>
            <li>
              <strong>Start the backend:</strong>
              <pre style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px", overflow: "auto" }}>
                npm install npm run dev
              </pre>
            </li>
            <li>
              <strong>In a new terminal, start the frontend:</strong>
              <pre style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px", overflow: "auto" }}>
                cd frontend npm install npm run dev
              </pre>
            </li>
            <li>
              <strong>Open your browser to:</strong> <code>http://localhost:3000</code>
            </li>
          </ol>
        </div>

        <div style={{ marginTop: "30px", backgroundColor: "#e3f2fd", padding: "20px", borderRadius: "6px" }}>
          <h3 style={{ marginTop: 0 }}>Features:</h3>
          <ul style={{ textAlign: "left", lineHeight: "1.8" }}>
            <li>
              <strong>Citizen Features:</strong> Register, view notices, file complaints, chat with bot
            </li>
            <li>
              <strong>Admin Features:</strong> Manage complaints, post notices, view statistics
            </li>
            <li>
              <strong>Authentication:</strong> JWT-based with role-based access control
            </li>
            <li>
              <strong>Admin Registration:</strong> Check "Register as Admin" and enter code:{" "}
              <code>ADMIN_SECRET_2024</code>
            </li>
          </ul>
        </div>

        <div style={{ marginTop: "30px", backgroundColor: "#fff3e0", padding: "20px", borderRadius: "6px" }}>
          <h3 style={{ marginTop: 0 }}>Quick Setup:</h3>
          <ol style={{ textAlign: "left", lineHeight: "1.8" }}>
            <li>
              Set up MongoDB Atlas and add <code>MONGODB_URI</code> to <code>.env</code>
            </li>
            <li>
              Add <code>JWT_SECRET</code> to <code>.env</code>
            </li>
            <li>
              Add <code>ADMIN_SETUP_CODE</code> to <code>.env</code> (or use default)
            </li>
            <li>Run backend and frontend as shown above</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
