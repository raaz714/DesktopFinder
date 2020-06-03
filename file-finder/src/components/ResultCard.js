import React from 'react'

import { makeStyles } from '@material-ui/core/styles'

import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Grid from '@material-ui/core/Grid'

import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import { red } from '@material-ui/core/colors'
import MoreVertIcon from '@material-ui/icons/MoreVert'

const electron = window.require('electron')
// const path = window.require('path')

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 10,
    margin: 5,
    backgroundColor: 'beige',
  },
  avatar: {
    backgroundColor: red[500],
  },
}))

const handleCheck = (file) => {
  // electron.remote.app
  //   .getFileIcon(path.normalize(file), { size: 'large' })
  //   .then((icon) => {
  //     let url = icon.toDataURL()
  //     console.log(url)
  //   })
  electron.shell.openPath(file)
}

export default function RecipeReviewCard(props) {
  const classes = useStyles()

  return (
    <Grid item sm>
      <Card className={classes.root}>
        <CardHeader
          avatar={
            <Avatar aria-label='recipe' className={classes.avatar}>
              {props.fileName[0]}
            </Avatar>
          }
          action={
            <IconButton aria-label='settings'>
              <MoreVertIcon />
            </IconButton>
          }
          title={props.fileName}
          subheader={props.fileExt}
        />
        <CardContent>
          <Typography variant='body2' color='textSecondary' component='div'>
            {props.filePath}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size='small'
            color='primary'
            onClick={() => handleCheck(props.filePath)}
          >
            Open File
          </Button>
        </CardActions>
      </Card>
    </Grid>
  )
}
