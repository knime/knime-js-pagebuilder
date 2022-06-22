<script>
import Label from 'webapps-common/ui/components/forms/Label';
import ErrorMessage from '@/components/widgets/baseElements/text/ErrorMessage';

const DATA_TYPE_KEY = 'value';

const FALLBACK_WS_URL = 'ws://localhost:3001';
const FPS = 0.1;

export default {
    components: {
        Label,
        ErrorMessage
    },
    props: {
        nodeConfig: {
            required: true,
            type: Object,
            validator(obj) {
                return obj.nodeInfo;
            }
        },
        nodeId: {
            required: true,
            type: String,
            validator(nodeId) {
                return nodeId !== '';
            }
        },
        isValid: {
            default: true,
            type: Boolean
        },
        valuePair: {
            default: () => ({
                [DATA_TYPE_KEY]: ''
            }),
            type: Object
        },
        errorMessage: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            usingWebSocket: false,
            capturingInterval: null
        };
    },
    computed: {
        viewRep() {
            return this.nodeConfig.viewRepresentation;
        },
        label() {
            return this.viewRep.label;
        },
        value() {
            // unwrap the value form the array, single selection values are still arrays in the json
            // because they share some impl parts with multiple selection values
            return this.valuePair[DATA_TYPE_KEY][0];
        }
    },
    async mounted() {
        try {
            let stream = await navigator.mediaDevices.getUserMedia({ video: { width: 426, height: 240 } });
            this.$refs.video.srcObject = stream;
            this.startContinuousCapturing();
        } catch (e) {
            // couldn't access webcam, try to connect to WebSocket (only as work-around while developing)
            consola.log(`Couldn't access webcam, trying to connect to ${FALLBACK_WS_URL}`);
            this.usingWebSocket = true;
            const ws = new WebSocket(FALLBACK_WS_URL);
            ws.onopen = () => {
                consola.log(`Connected to ${FALLBACK_WS_URL}`);
            };
            ws.onmessage = (message) => {
                this.$refs.image.src = message.data;

                // start capturing on first message
                if (!this.capturingInterval) {
                    this.startContinuousCapturing();
                }
            };
        }
    },
    beforeDestroy() {
        clearInterval(this.capturingInterval);
    },
    methods: {
        captureFrame() {
            let imageDataURL;
            if (this.usingWebSocket) {
                imageDataURL = this.$refs.image.src;
            } else {
                const video = this.$refs.video;
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                const data = canvas.toDataURL('image/png');
                imageDataURL = String(data);
            }
            this.onChange(imageDataURL.replace('data:image/png;base64,', ''));
        },
        startContinuousCapturing() {
            this.capturingInterval = setInterval(() => {
                this.captureFrame();
            }, 1000 / FPS);
        },
        onChange(value) {
            const changeEventObj = {
                nodeId: this.nodeId,
                type: DATA_TYPE_KEY,
                value: [value]
            };
            this.$emit('updateWidget', changeEventObj);
        },
        validate() {
            if (this.viewRep.possibleChoices.length === 0) {
                return { isValid: false, errorMessage: 'No choices were specified.' };
            }
            let isValid = true;
            let errorMessage;
            if (this.viewRep.required && !this.$refs.form.hasSelection()) {
                isValid = false;
                errorMessage = 'Selection is required.';
            }
            if (typeof this.$refs.form.validate === 'function') {
                let validateEvent = this.$refs.form.validate();
                isValid = Boolean(validateEvent.isValid && isValid);
                errorMessage = validateEvent.errorMessage || errorMessage || 'Current selection is invalid.';
            }
            return { isValid, errorMessage: isValid ? null : errorMessage };
        }
    }
};
</script>

<template>
  <Label
    :text="label"
  >
    <video
      v-if="!usingWebSocket"
      ref="video"
      autoplay
    />
    <img
      v-else
      ref="image"
    >
    <ErrorMessage :error="errorMessage" />
  </Label>
</template>

<style scoped>
video,
img {
  width: 436px;
  height: 240px;
}
</style>
