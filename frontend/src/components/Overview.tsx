import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CreateForm from "./CreateForm";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useTranslation } from "react-i18next";

function MitarbeiterPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [entries, setEntries] = useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);

  const handleClose = () => {
    setSelectedEntryId(null);
    setOpen(false);
  };

  const handleClickOpen = (id: number) => {
    setSelectedEntryId(id);
    setOpen(true);
  };

  const fetchEntries = async () => {
    await fetch("http://localhost:5001/api/transcriptions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setEntries(data))
      .catch((error) => console.error("Error fetching entries:", error));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDelete = () => {
    fetch(`http://localhost:5001/api/transcriptions/${selectedEntryId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 204) {
          setOpen(false);
          setSelectedEntryId(null);
          fetchEntries();
          return;
        }
        return response.json();
      })
      .then(() => {
        fetchEntries();
      })
      .catch((error) => console.error("Error deleting entry:", error));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ minHeight: "100vh" }}>
        <Navbar title="overview" />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CreateForm fetchEntries={fetchEntries} />
        </LocalizationProvider>
        <Grid container spacing={2}>
          {entries.map((entry) => (
            <Grid item size={{ xs: 12, sm: 6 }} key={entry.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: entry.is_closed ? "#d5d5d5" : "white",
                  color: entry.is_closed ? "gray" : "black",
                  textAlign: "left",
                  width: 418,
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/detailview/${entry.id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {t("title")}: {entry.title}
                    </Typography>
                    <Typography variant="h6" component="div">
                      {t("location")}: {entry.location}
                    </Typography>
                    <Typography variant="h6" component="div">
                      {t("date")}:{" "}
                      {new Date(entry.date).toLocaleString("de-DE", {
                        dateStyle: "medium",
                      })}
                    </Typography>
                    <Typography variant="h6" component="div">
                      {t("description")}: {entry.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ marginTop: "auto" }}>
                  <Button
                    color="error"
                    onClick={() => handleClickOpen(entry.id)}
                    component="div"
                  >
                    <DeleteIcon />
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {entries.length === 0 && (
            <Grid item xs={12} sm={6} key={0}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  width: 418,
                  boxShadow: 0,
                }}
              />
            </Grid>
          )}
          {entries.length <= 1 && (
            <Grid item xs={12} sm={6} key={-1}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  width: 418,
                  boxShadow: 0,
                }}
              />
            </Grid>
          )}
        </Grid>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          <DialogTitle id="confirm-dialog-title">
            {t("deleteTitle")}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-dialog-description">
              {t("deleteConfirmation")}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t("cancel")}</Button>
            <Button onClick={handleDelete} autoFocus color="error">
              {t("delete")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default MitarbeiterPage;
