<template>
  <v-layout row justify-center align-center>
    <!-- Main page -->
    <v-flex xs12>
    <v-breadcrumbs :items="breadcrumbs" divider=">"></v-breadcrumbs>
      <v-card>
        <v-card-title class="display-2">{{ image.name }}</v-card-title>
        <v-card-text>
          <tooltip :source="image.source" :text="image.tooltip" :position="image.tooltipPosition"></tooltip>
        </v-card-text>
        <v-card-actions>
          <v-btn nuxt :to="'/'" color="primary"><v-icon left>keyboard_arrow_left</v-icon> Back </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Tooltip from '@/components/Tooltip'

export default {
  components: {
    Tooltip
  },
  async mounted () {
    let { id } = this.$route.params
    this.$db.find({ _id: id }, (error, image) => {
      if (error) return null
      this.image = Object.assign({}, image[0])
    })
  },
  computed: {
    breadcrumbs: function () {
      return [
        { text: 'Tooltip Picture Manager',
          disabled: false,
          href: '/' },
        { text: this.image.name,
          disabled: true }
      ]
    }
  },
  data () {
    return {
      image: {
        source: '',
        height: '',
        width: '',
        name: '',
        size: 0,
        createdAt: '',
        tooltip: '',
        tooltipPosition: ''
      }
    }
  }
}
</script>
