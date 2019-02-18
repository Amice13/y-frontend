<template>
  <v-layout row justify-center align-center>

    <!-- Main page -->
    <v-flex xs12>
      <v-card>
        <v-card-title class="display-2">Tooltip Picture Manager</v-card-title>
        <v-card-text>
          <input type="file" hidden accept=".png, .jpg, .jpeg, .svg, .gif" id="file" ref="file" @change="handleFileUpload">
          <v-layout row wrap pb-3>
            <v-flex xs10 sm9 id="search-place">
              <v-text-field name="search" v-model="filter" @keyup.enter="filterList" solo hide-details prepend-icon="search" label="Search" id="search"></v-text-field>
            </v-flex>
            <v-flex xs12 sm3 text-xs-right>
              <v-btn block @click.native.prevent="$refs.file.click" color="primary">
                <v-icon left>publish</v-icon> Upload
              </v-btn>
            </v-flex>
          </v-layout>
          <v-divider></v-divider>
          <v-layout row wrap pt-4 pb-1 v-if="imageList.length === 0">
            <v-flex xs12 text-xs-center>
              You have not uploaded any images yet!
            </v-flex>
          </v-layout>
          <div v-if="imageList.length > 0">
            <v-layout row wrap pt-4 pb-1 hidden-sm-and-down class="grey lighten-3">
              <v-flex xs1 pl-2>Preview</v-flex>
              <v-flex xs4 pl-2 pr-2 @click="sortList('tooltip')" class="sortable">Tooltip</v-flex>
              <v-flex xs2 pl-2 pr-2 @click="sortList('name')" class="sortable">Filename</v-flex>
              <v-flex xs2 pl-2 pr-2 text-xs-center>Properties</v-flex>
              <v-flex xs1 pl-2 pr-2 text-xs-center @click="sortList('size')" class="sortable">Size</v-flex>
              <v-flex xs2 pl-2 pr-2 text-xs-center>Actions</v-flex>
            </v-layout>
            <v-layout v-for="(item, index) in imageList" align-center :key="'image-' + index" row wrap pb-1 style="border-bottom:1px solid #ccc;">
              <v-flex sm1 xs12 pl-2 pr-2>
                <v-img :src="item.source" :aspect-ratio="1" />
              </v-flex>
              <v-flex sm4 pb-2 xs12 pl-2 pr-2 text-md-left text-xs-center> {{ item.tooltip }}<br/>
                <span class="grey--text">[position: {{ item.tooltipPosition }}]</span></v-flex>
              <v-flex sm2 xs4 pl-2 pr-2 text-md-left text-xs-center>{{ item.name }}</v-flex>
              <v-flex sm2 xs4 pl-2 pr-2 text-xs-center>{{ item.width }} × {{ item.height }}</v-flex>
              <v-flex sm1 xs4 pl-2 pr-2 text-xs-center>{{ (item.size / (Math.pow(1024, 2))).toFixed(2) }} MB</v-flex>
              <v-flex sm2 xs12 pl-2 pr-2 text-xs-center>
                <v-btn nuxt :to="'/image/' + item._id"small :block="$vuetify.breakpoint.smAndDown" :flat="!$vuetify.breakpoint.smAndDown">
                  <v-icon :left="$vuetify.breakpoint.smAndDown">play_arrow</v-icon>
                  <span class="hidden-sm-and-up"> View</span></v-btn>
                <v-btn @click.native="editImage(item)" small :block="$vuetify.breakpoint.smAndDown" :flat="!$vuetify.breakpoint.smAndDown">
                  <v-icon :left="$vuetify.breakpoint.smAndDown">edit</v-icon>
                  <span class="hidden-sm-and-up"> Edit</span></v-btn>
                <v-btn @click.native="imageToDelete = item._id" small :block="$vuetify.breakpoint.smAndDown" :flat="!$vuetify.breakpoint.smAndDown">
                  <v-icon :left="$vuetify.breakpoint.smAndDown">delete</v-icon>
                  <span class="hidden-sm-and-up"> Delete</span></v-btn>
              </v-flex>
            </v-layout>
          </div>
          <div class="text-xs-center">
            <v-pagination v-show="pages > 1" v-model="page" :length="pages"></v-pagination>
          </div>
        </v-card-text>
      </v-card>
    </v-flex>

    <!-- Upload dialog -->
    <v-dialog v-model="uploadDialog" persistent scrollable :overlay="true" max-width="800px" transition="dialog-transition">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          <h2><span v-if="editMode">Edit</span><span v-else>Upload</span> image</h2>
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
              <p><strong>Width and height</strong> {{ image.width }} × {{ image.height }}</p>
              <p><strong>Uploaded at:</strong> {{ image.createdAt.toLocaleString('ru', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }) }}</p>
              <v-text-field name="tooltip" label="Add tooltip" v-model="image.tooltip"></v-text-field>
              <v-select :items="positions" v-model="image.tooltipPosition" label="Tooltip position"></v-select>
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click.native.prevent='uploadDialog = false'><v-icon left>close</v-icon>Discard</v-btn>
          <v-btn v-if="editMode" @click.native.prevent="updateImage" color="primary"><v-icon left>update</v-icon>Update</v-btn>
          <v-btn v-else @click.native.prevent="saveImage" color="primary"><v-icon left>save</v-icon>Save</v-btn>
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

    <!-- Success dialog -->
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

    <!-- Delete confirmation dialog -->
    <v-dialog :value="imageToDelete" persistent scrollable :overlay="true" max-width="500px" transition="dialog-transition">
      <v-card>
        <v-card-title class="headline blue lighten-1" dark primary-title>
          <h2 class="white--text">Confirmation</h2>
        </v-card-title>
        <v-card-text>
          <p>Are you sure you want to delete the image? This action can't be reversed.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="imageToDelete = ''">Cancel</v-btn>
          <v-btn @click="removeImage" color="primary">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  async mounted () {
    let image = this.$refs.image
    image.onload = () => {
      this.image.width = image.naturalWidth
      this.image.height = image.naturalHeight
    }
    this.filterList()
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
      this.$db.insert(this.image, (error, newDoc) => {
        if (error) this.error = error.message
        this.success = 'Your image was successfully stored!'
        this.uploadDialog = false
        this.filterList()
        return null
      })
    },
    editImage (item) {
      this.editMode = true
      this.editId = item._id
      this.image = Object.assign({}, item)
      this.uploadDialog = true
    },
    updateImage () {
      this.$db.update({ _id: this.editId }, this.image, (error, updated) => {
        this.editId = ''
        this.editMode = false
        this.uploadDialog = false
        if (error) {
          this.error = error
          return null
        }
        this.success = 'You successfully updated the image!'
        this.filterList()
      })
    },
    removeImage () {
      this.$db.remove({ _id: this.imageToDelete }, (error, removed) => {
        this.imageToDelete = ''
        if (error) {
          this.error = error
          return null
        }
        this.success = 'You successfully deleted the image!'
        this.filterList()
      })
    },
    filterList () {
      this.page = 1
      let query = { $or: [
        { name: { $regex: new RegExp(this.filter, 'gi') } },
        { tooltip: { $regex: new RegExp(this.filter, 'gi') } }
      ] }
      this.cursor = this.$db.find(query).sort({ [this.sort]: this.sortAsc })
      this.cursor.limit(this.limit).exec((error, data) => {
        if (error) {
          this.error = error
          return null
        }
        this.imageList = data
      })
      this.$db.count(query, (error, count) => {
        if (error) this.error = error
        this.pages = Math.ceil(count / this.limit)
      })
      return false
    },
    sortList (type) {
      if (this.sort === type) {
        this.sortAsc = this.sortAsc === 1 ? -1 : 1
      } else {
        this.sort = type
        this.sortAsc = 1
      }
      this.filterList()
    }
  },
  computed: {
    skip () {
      return (this.page - 1) * this.limit
    }
  },
  watch: {
    page: function (value) {
      this.cursor.skip(this.skip).exec((error, data) => {
        if (error) {
          this.error = error
          return null
        }
        this.imageList = data
      })
    }
  },
  data () {
    return {
      file: '',
      positions: ['Top', 'Bottom', 'Left', 'Right'],
      editMode: false,
      editId: '',
      imageSource: '',
      imageList: [],
      dbCursor: null,
      filter: '',
      sort: 'createdAt',
      sortAsc: 1,
      image: {
        source: '',
        height: '',
        width: '',
        name: '',
        size: 0,
        createdAt: '',
        tooltip: '',
        tooltipPosition: ''
      },
      error: '',
      success: '',
      imageToDelete: '',
      uploadDialog: false,
      page: 1,
      pages: 0,
      limit: 10
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

<style>

#search-place .v-input__control {
  min-height: 36px !important;
  padding: 6px !important;
}

.sortable {
  cursor: pointer;
  font-weight: bold;
}

.sortable:hover {
  text-decoration: underline;
}

</style>