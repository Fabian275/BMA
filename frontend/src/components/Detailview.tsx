import { Box, Button, Snackbar, Alert, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import Navbar from "./Navbar";
import { useParams } from "react-router-dom";
import UpdateForm from "./UpdateForm";
import CreateTranscription from "./CreateTranscription";
import { useTranslation } from "react-i18next";
import Summary from "./Summary";

interface Entry {
  title: string | null;
  date: Date | null;
  description: string | null;
  transcribed_text?: string;
  summary_text?: string | null;
}

const Detailview = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [entry, setEntry] = useState<Entry>({
    title: "",
    date: null,
    description: null,
    transcribed_text: "",
    summary_text: null,
  });
  const [notification, setNotification] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const [changes , setChanges] = useState(false);
  const [originalText, setOriginalText] = useState<string | null>(null);

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
      .then((data) => {
        setEntry({
          title: data.title,
          date: new Date(data.date),
          description: data?.description,
          transcribed_text: data.transcription && data.transcription.transcribed_text,
          summary_text: data.transcription && data.transcription.summary_text,
        });
        setOriginalText(data.transcription && data.transcription.transcribed_text);
      })
      .catch((error) => console.error("Error fetching entries:", error));
  };

  useEffect(() => {
    fetchEntry();
  }, []);

  return (
    <Container>
      <Box>
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
          setChanges={setChanges}
          changes={changes}
          originalText={originalText}
        />
        {entry.transcribed_text &&
        <Summary entryId={id!} changes={changes} entry={entry} fetchEntry={fetchEntry} setChanges={setChanges}/>
        }
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
