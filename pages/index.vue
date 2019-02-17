<template>
  <v-layout row justify-center align-center>

    <!-- Main page -->
    <v-flex xs12>
      <v-card>
        <v-card-title class="headline">Tooltip Picture Manager</v-card-title>
        <v-card-text>
          <input type="file" hidden accept=".png, .jpg, .jpeg, .svg, .gif" id="file" ref="file" @change="handleFileUpload">
          <v-layout row wrap>
            <v-flex xs10>
              <!-- Add filtering options -->
            </v-flex>
            <v-flex xs2 text-xs-right>
              <v-btn @click.native.prevent="$refs.file.click" color="primary">
                <v-icon left>publish</v-icon> Upload 
              </v-btn>
            </v-flex>
          </v-layout>
          <v-divider></v-divider>
          <v-layout row wrap pt-4 pb-1>
            <v-flex xs12 text-xs-center>
              You have not uploaded any images yet!
            </v-flex>
            
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>

    <!-- Upload dialog -->
    <v-dialog v-model="uploadDialog" scrollable :overlay="true" max-width="800px" transition="dialog-transition">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          <h2>Upload image</h2>
        </v-card-title>
        <v-card-text>
          <v-layout row wrap>
            <v-flex xs3>
              <v-img :aspect-ratio="1" v-show="image.source" :src="image.source" />
              <!-- Image to get actual width and height -->
              <img ref="image" v-show="image.source" :src="image.source" hidden />
            </v-flex>
            <v-flex xs9 pl-4>
              <p><strong>Filename:</strong> {{ image.name }}</p>
              <p><strong>Size:</strong> {{ (image.size / (Math.pow(1024, 2))).toFixed(2) }} MB</p>
              <p><strong>Width and height</strong> {{ image.width }}x{{ image.height }}</p>
              <p><strong>Uploaded at:</strong> {{ image.createdAt.toLocaleString('ru', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }) }}</p>
              <v-text-field name="tooltip" label="Add tooltip" v-model="image.tooltip"></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click.native.prevent='uploadDialog = false'><v-icon left>close</v-icon>Discard</v-btn>
          <v-btn @click.native.prevent="saveImage" color="primary"><v-icon left>save</v-icon>Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error dialog -->
    <v-dialog :value="error" scrollable :overlay="true" max-width="500px" transition="dialog-transition">
      <v-card>
        <v-card-title class="headline red lighten-1" dark primary-title>
          <h2 class="white--text">Error</h2>
        </v-card-title>
        <v-card-text>
          <p>{{ error }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="error = ''">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error dialog -->
    <v-dialog :value="success" scrollable :overlay="true" max-width="500px" transition="dialog-transition">
      <v-card>
        <v-card-title class="headline green lighten-1" dark primary-title>
          <h2 class="white--text">Success</h2>
        </v-card-title>
        <v-card-text>
          <p>{{ success }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="success = ''">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import Nedb from 'nedb'
const db = new Nedb({ filename: 'images', autoload: true })

export default {
  mounted () {
    let image = this.$refs.image
    db.find({}, (error, data) => {
      if (error) this.error = error
      this.imageList = data
    })
    image.onload = () => {
      this.image.width = image.naturalWidth
      this.image.height = image.naturalHeight
    }
  },
  methods: {
    async handleFileUpload () {
      if (!this.$refs.file.files) return null
      let file = this.$refs.file.files[0]
      if (!file.type.match(/^image/)) {
        this.error = 'Uploaded file is not an image. Try to upload another one, please!'
        return null
      }
      let data = await getDataUrl(file)
      this.image.name = file.name
      this.image.size = file.size
      this.image.source = data
      this.image.createdAt = new Date()
      this.uploadDialog = true
    },
    saveImage () {
      db.insert(this.image, (error, newDoc) => {
        if (error) this.error = error.message
        this.success = 'Your image was successfully stored!'
        this.uploadDialog = false
        return null
      })
    }
  },
  data () {
    return {
      file: '',
      imageSource: '',
      imageList: [],
      image: {
        source: '',
        height: '',
        width: '',
        name: '',
        size: 0,
        createdAt: '',
        tooltip: ''
      },
      error: '',
      success: '',
      uploadDialog: false
    }
  }
}

const getDataUrl = (file) => {
  let reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
</script>