

const prepareContract = (gig) => {

    let contract = `VOCALRISER AGREEMENT

    Dated as of ${new Date().toString()}
    
    The following shall constitute the Agreement (the “Agreement”) between ${gig.createdBy}	(referred to
    herein as “Producer”) and 	(“Artist”) with respect to the production of master recording(s) which embodies or embody the musical composition entitled: “${gig.name}” (the “Master”) featuring the performances of Artist 
    SERVICES:
    Artist engages Producer to produce the Master for and on behalf of Company and Producer shall perform all services customarily rendered by producers in the music industry.
    Producer shall at all times diligently, competently, expeditiously and to the best of Producer’s ability perform the services required to be performed by Producer hereunder, subject to the supervision of the recording project by Artist and Company.
    Producer also agrees to render services as a musician, arranger, conductor, programmer, etc. at recording sessions as and when requested by Artist.
    The term of this Agreement shall commence as of the date hereof and shall continue until such time as Producer shall have satisfactorily completed Producer’s services hereunder.
    
    
    SAMPLE CLEARANCE:
    Producer shall not use or furnish any samples or interpolated compositions on the Master unless such sample or interpolation has first been approved in writing by Artist. If Producer fails to comply with the terms of the preceding sentence, then, without limiting the rights and remedies available to Artist, Producer shall be:
    solely liable for all royalties or other monies due any person or entity whose master recordings or compositions are sampled or interpolated on the Master; and
    solely responsible for any copyright interests and rights that are required to be transferred, conveyed, or assigned to the owner or licensor of any sample or interpolated composition embodied on the Master.

    This is a sample music contract only. For the full eleven-­‐page version of this contract, please purchase this contract from www.musiclawcontracts.com.
    `
    return contract
}


module.exports = prepareContract;