export default class Box {
	constructor(viewer) {
		this.viewer = viewer;
		this.list = [];
	}
	add(ele) {
		this.list.push(ele);
		if (ele instanceof Cesium.Entity) {
			this.viewer.entities.add(ele);
		} else if (ele instanceof Cesium.Primitive) {
			this.viewer.scene.primitives.add(ele);
		} else if (ele instanceof Cesium.ParticleSystem) {
			this.viewer.scene.primitives.add(ele);
		}
		return ele
	}
	destroy() {
		this.list.forEach((ele) => {
			if (ele instanceof Cesium.Entity) {
				this.viewer.entities.remove(ele);
			} else if (ele instanceof Cesium.Primitive) {
				this.viewer.scene.primitives.remove(ele);
			} else if (ele instanceof Cesium.ParticleSystem) {
				this.viewer.scene.primitives.remove(ele);
			}
		});
	}
	setVisible(visible) {
		this.list.forEach((ele) => (ele.show = visible));
	}
}
