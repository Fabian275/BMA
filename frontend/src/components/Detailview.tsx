import { Box, Button, Snackbar, Alert, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import Navbar from "./Navbar";
import { useParams } from "react-router-dom";
import UpdateForm from "./UpdateForm";
import CreateTranscription from "./CreateTranscription";
import axios from "axios";
import { useTranslation } from "react-i18next";

interface Entry {
  title: string | null;
  location: string;
  date: Date | null;
  description: string;
  is_closed: boolean;
  transcribed_text?: string;
}

const Detailview = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [entry, setEntry] = useState<Entry>({
    title: "",
    location: "",
    date: null,
    description: "",
    is_closed: false,
  });
  const [notification, setNotification] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();

  const fetchEntry = async () => {
    await fetch(`http://localhost:5001/api/transcriptions/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) =>
        setEntry({
          title: data.title,
          location: data.location,
          date: new Date(data.date),
          description: data.description,
          is_closed: data.is_closed,
          transcribed_text: data.transcription[0]?.transcribed_text,
        })
      )
      .catch((error) => console.error("Error fetching entries:", error));
  };

  const completeTranscription = async () => {
    await axios
      .patch(
        `http://localhost:5001/api/transcriptions/${id}/complete`,
        {
          is_closed: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.status === 200) {
          setNotification("success");
          fetchEntry();
        } else {
          setNotification("error");
        }
      })
      .catch((error) => console.error("Error creating entry:", error));
  };

  useEffect(() => {
    fetchEntry();
  }, []);

  return (
    <Container>
      <Box sx={{ height: "100vh", justifyContent: "center" }}>
        <Navbar title="detailview" />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 6,
            mb: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => window.history.back()}
            sx={{ mt: 2, mb: 2 }}
          >
            {t("back")}
          </Button>
        </Box>
        <UpdateForm entry={entry} setEntry={setEntry} fetchEntry={fetchEntry} />
        <CreateTranscription
          entry={entry}
          setEntry={setEntry}
          fetchEntry={fetchEntry}
        />
        {entry.transcribed_text && !entry.is_closed && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
              mb: 2,
            }}
          >
            <Button />
            <Button
              variant="outlined"
              onClick={() => {
                completeTranscription();
              }}
              sx={{ mt: 2, mb: 2 }}
            >
              {t("complete")}
            </Button>
          </Box>
        )}
        {notification && (
          <Snackbar
            open={notification !== null}
            autoHideDuration={1000}
            onClose={() => setNotification(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={() => setNotification(null)}
              severity={notification === "success" ? "success" : "error"}
              sx={{ width: "100%" }}
              variant="filled"
            >
              {notification === "success"
                ? t("entryCreated")
                : t("entryCreationError")}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </Container>
  );
};

export default Detailview;
